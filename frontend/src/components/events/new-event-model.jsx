import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "../data-range-picker";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { TimePicker12 } from "../ui/time-picker/time-picker-12h";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function NewEventModel() {
  const [date, setDate] = useState(new Date());

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="ml-auto">
          <Plus className="mr-2 size-4" />
          Create New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit">
        <DialogTitle className="mb-3 text-center">Create New Event</DialogTitle>
        <div className="flex gap-8">
          <div className="grid gap-6">
            <Input placeholder="Event Name" />
            <DateRangePicker className="w-full" />
            <div className="flex items-center justify-between gap-8">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <TimePicker12 date={date} setDate={setDate} />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <TimePicker12 date={date} setDate={setDate} />
              </div>
            </div>
            <Textarea placeholder="Event Description" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid w-72 gap-4 rounded-lg bg-[#E5EEF5] p-4">
              <div className="grid gap-2">
                <Label className="text-sm">Handler</Label>
                <div className="flex items-center gap-2">
                  <Plus className="size-4" />
                  <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                  </Avatar>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm">Animals</Label>
                <div className="flex items-center gap-2">
                  <Plus className="size-4" />
                  <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                  </Avatar>
                  <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                  </Avatar>
                  <Avatar className="size-5">
                    <AvatarImage src="https://avatar.vercel.sh/ahmedivy.png" />
                  </Avatar>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Check out immediately</Label>
                <Switch />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Event Type" defaultValue="event-type-1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event-type-1">Event Type 1</SelectItem>
                <SelectItem value="event-type-2">Event Type 2</SelectItem>
              </SelectContent>
            </Select>
            <div className="my-2 flex justify-end">
              <Button>
                Create
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
