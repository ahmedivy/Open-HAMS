import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";

import { toast } from "sonner";
import { AutoComplete } from "../ui/auto-complete/auto-complete";

type CustomSelectProps = {
  label: string;
  options: { value: string; label: string; toRender: JSX.Element }[];
  selected: string[];
  setSelected: (value: string[]) => void;
  placeholder: string;
  listElement: (props: { value: string }) => JSX.Element;
};

export function CustomSelect({
  label,
  options,
  selected,
  setSelected,
  placeholder,
  listElement: ListElement,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onValueChange = (value: string) => {
    if (selected.includes(value)) {
      toast.error(`${label} already added`);
      setIsOpen(false);
      return;
    }

    setSelected([...selected, value]);
    setIsOpen(false);
  };

  return (
    <div className="grid">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        {isOpen ? (
          <div className="flex h-12 w-full items-center gap-3">
            <Search className="size-4 font-black" />
            <AutoComplete
              options={options!}
              onValueChange={onValueChange}
              emptyMessage={`No ${label} found`}
              placeholder={placeholder}
            />
          </div>
        ) : (
          <div className="flex h-12 items-center gap-2">
            <Plus
              className="size-5 cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
            {selected.map((id) => (
              <ListElement value={id} key={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
