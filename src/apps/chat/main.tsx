import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { OpenAIModelID } from '@/types/openai';

import './styles/globals.css';
import HomeView from './views/home';

export default function App() {
  const queryClient = new QueryClient();

  return (
    <div className="">
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <HomeView
          serverSideApiKeyIsSet={true}
          serverSidePluginKeysSet={false}
          defaultModelId={OpenAIModelID.GPT_3_5}
        />
      </QueryClientProvider>
    </div>
  );
}
