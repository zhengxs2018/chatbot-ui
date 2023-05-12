import { IconFileImport } from '@tabler/icons-react';
import type { SupportedExportFormats } from '@/types/export';

import { SidebarButton } from '../Sidebar/SidebarButton';

interface Props {
  onImport: (data: SupportedExportFormats) => void;
}

export const Import = ({ onImport }: Props) => {
  return (
    <>
      <input
        id="import-file"
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json"
        onChange={(e) => {
          if (!e.target.files?.length) return;

          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            onImport(JSON.parse(e.target?.result as string));
          };
          reader.readAsText(file);
        }}
      />

      <SidebarButton
        text='Import data'
        icon={<IconFileImport size={18} />}
        onClick={() => {
          const importFile = document.querySelector(
            '#import-file',
          ) as HTMLInputElement;
          if (importFile) {
            importFile.click();
          }
        }}
      />
    </>
  );
};
