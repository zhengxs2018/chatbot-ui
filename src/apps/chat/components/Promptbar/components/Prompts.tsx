import type { Prompt } from '@/types/prompt';

import { PromptComponent } from './Prompt';

interface Props {
  prompts: Prompt[];
}

export const Prompts = ({ prompts }: Props) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {prompts
        .slice()
        .reverse()
        .map((prompt, index) => (
          <PromptComponent key={index} prompt={prompt} />
        ))}
    </div>
  );
};
