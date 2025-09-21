import { Loader as LoaderIcon } from 'lucide-react';

export const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};
