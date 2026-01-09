import { Loader } from 'lucide-react';

export const Loading = ({ fullScreen = false }) => {
  const content = (
    <div className="flex justify-center items-center space-x-2">
      <Loader className="animate-spin" size={24} />
      <span>Chargement...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        {content}
      </div>
    );
  }

  return <div className="flex justify-center items-center py-8">{content}</div>;
};

export default Loading;
