import https from "https";

export async function runSupabaseSql(sqlQuery) {
  const token = process.env.SUPABASE_ACCESS_TOKEN || "";
  const projectRef = process.env.SUPABASE_PROJECT_REF || "aegonziakbxbhlgomlvq";
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sqlQuery });

    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${projectRef}/database/query`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });
}
