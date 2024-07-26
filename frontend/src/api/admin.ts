import instance from "./axios";

export async function getReports(from: Date, to: Date, entity: string) {
  const res = await instance.get("/admin/reports", {
    params: {
      from_: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
      entity: entity.toLowerCase(),
    },
  });
  return res;
}
