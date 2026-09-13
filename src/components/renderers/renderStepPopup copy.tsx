import { createRoot } from "react-dom/client";
import { StepPopup, type StepPopupProps } from "../StepPopup";
import i18n from "@/i18n";
import { I18nextProvider } from "react-i18next";

export function renderStepPopup(props: StepPopupProps): HTMLDivElement {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(
    <I18nextProvider i18n={i18n}>
      <StepPopup {...props} />
    </I18nextProvider>,
  );
  return container;
}
