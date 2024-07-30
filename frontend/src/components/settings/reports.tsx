import { getReports } from "@/api/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { DatePickerWithRange } from "../dashboard/date-range-picker";
import { Spinner } from "../icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export function ReportsSettings() {
  const [selected, setSelected] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState("Events");

  async function handleSubmit() {
    if (
      selected.from > selected.to ||
      selected.to > new Date() ||
      selected.from > new Date()
    ) {
      toast.error("Invalid date range");
      return;
    }
    setLoading(true);

    const res = await getReports(selected.from, selected.to, entity);
    if (res.status === 200) {
      // download automatically
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${entity}.csv`);

      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLoading(false);
      toast.success("Report downloaded successfully");
    } else {
      toast.error(res.data.detail);
    }
  }

  return (
    <section className="mt-8 w-full rounded-md bg-white p-8 shadow-sm">
      <div className="mt-10 w-full max-w-[900px] rounded-lg border bg-white p-8 shadow-sm">
        <div className="flex w-full max-w-[400px] flex-col gap-8">
          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger className="">
              <SelectValue placeholder="Select Export Category" />
            </SelectTrigger>
            <SelectContent>
              {["Events", "Users", "Animals"].map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-2">
            <Label>Select Date Range</Label>
            <DatePickerWithRange
              className="w-full"
              date={selected}
              setDate={setSelected as any}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            {loading && <Spinner className="mr-2 size-4" />}
            Generate Report
          </Button>
        </div>
      </div>
    </section>
  );
}
