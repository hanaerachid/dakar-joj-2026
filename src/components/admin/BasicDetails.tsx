import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { TextInput } from "../common/TextInput";
import { TextArea } from "../common/TextArea";
import { Section } from "../common/Section";
import { Checkbox } from "../ui/checkbox";
import { DateTimePicker } from "@/components/date-time-picker";

type Props = {
  name: string;
  setName: (v: string) => void;
  phase: string;
  setPhase: (v: string) => void;
  info: string;
  setInfo: (v: string) => void;
  isMajorStop: boolean;
  setIsMajorStop: (v: boolean) => void;
  tourDate: Date | undefined;
  setTourDate: (v: Date | undefined) => void;
};

export default function BasicDetails(props: Props) {
  const {
    name,
    setName,
    phase,
    setPhase,
    info,
    setInfo,
    isMajorStop,
    setIsMajorStop,
    tourDate,
    setTourDate,
  } = props;

  return (
    <>
      <Section title="Basic details">
        {/* Row 1: name */}
        <div className="grid gap-4 sm:grid-cols-1">
          <Field>
            <FieldLabel htmlFor="name">
              Stop name
            </FieldLabel>
            <TextInput
              id="name"
              placeholder="e.g. Iba Mar Diop Stadium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          <Field>
            <FieldLabel htmlFor="phase">
              Stop phase
            </FieldLabel>
            <TextInput
              id="phase"
              placeholder="e.g. Phase 1"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="info">
            Description
          </FieldLabel>
          <TextArea
            id="info"
            placeholder="Historic multi-use stadium in Dakar."
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          />
          <FieldDescription>Short description shown in the card/popup.</FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="isMajorStop"
            checked={isMajorStop}
            onCheckedChange={(checked) => setIsMajorStop(!!checked)}
          />
          <FieldLabel htmlFor="isMajorStop">
            Major Stop
          </FieldLabel>
        </Field>
        <Field>
          <FieldLabel htmlFor="tourDate">
            Tour Date
          </FieldLabel>
          <DateTimePicker
            date={tourDate}
            setDate={setTourDate}
          />
        </Field>
      </Section>
    </>
  );
}
