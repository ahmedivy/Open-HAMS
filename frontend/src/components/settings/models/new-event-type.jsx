import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewEventTypeModel() {
  return (
    <Dialog className="bg-blueish">
      <DialogTrigger>
        <Button>Add Event Type</Button>
      </DialogTrigger>
      <DialogContent className="bg-blueish">
        <form className="grid gap-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Add New Event Type</DialogTitle>
            <Button>Submit</Button>
          </div>
          <div className="grid gap-4">
            <Label>Event Type Name</Label>
            <Input
              className="w-full"
              placeholder="Add New Event Type Name..."
            />
          </div>
          <div className="grid gap-4">
            <Label>Select Group</Label>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Group" defaultValue="group1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group-1">Group 1</SelectItem>
                <SelectItem value="group-2">Group 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
