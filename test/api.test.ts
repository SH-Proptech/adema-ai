import request from "supertest";

const url = process.env.URL || "http://localhost:8181";
const basicAuthUser = process.env.CLIENT_ID;
const basicAuthPass = process.env.CLIENT_SECRET;
const basicAuth = Buffer.from(`${basicAuthUser}:${basicAuthPass}`).toString(
  "base64"
);

describe("POST /thread/:threadId", () => {
  it("should not be authorized", async () => {
    await request(url)
      .post("/thread/unauthorized-user-1-a")
      .set("Authorization", `Basic bullshit`)
      .send({ message: "Hello, this is a test message" })
      .expect("Content-Type", /text/)
      .expect(401);
  });

  it("should handle streaming responses", async () => {
    const response = await request(url)
      .post("/thread/authorized-user-1-a")
      .set("Authorization", `Basic ${basicAuth}`)
      .send({ message: "Hello, this is a test message" })
      .buffer(false) // Avoid buffering full response
      .parse((res, callback) => {
        res.on("data", (chunk) => {
          const data = chunk.toString();
          // Ensure it's a valid SSE message
          expect(data).toMatch(/^data: /); // SSE format check
        });

        res.on("end", () => {
          callback(null, null); // End the test
        });

        res.on("error", (err) => {
          callback(err, null);
        });
      });

    await response;
  }, 60000);
});

describe("GET /thread/:threadId", () => {
  it("should not be authorized", async () => {
    await request(url)
      .get("/thread/unauthorized-user-1-a")
      .set("Authorization", `Basic bullshit`)
      .expect("Content-Type", /text/)
      .expect(401);
  });

  it("should not return thread data", async () => {
    const response = await request(url)
      .get("/thread/nonexisitent-user-1-a")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect("Content-Type", /json/)
      .expect(404);

    // Add assertions for the response body here
    expect(response.body).toEqual({ message: "History not found" });
  });

  it("should return thread data", async () => {
    const response = await request(url)
      .get("/thread/authorized-user-1-a")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect("Content-Type", /json/)
      .expect(200);

    // Add assertions for the response body here
    expect(response.body).toHaveProperty("messages");
    expect(response.body.messages.length).toBeGreaterThan(0);
  });
});
