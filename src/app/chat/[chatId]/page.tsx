import { notFound } from 'next/navigation';
import { ChatContent } from './ChatContent';

export default async function ChatPage({ params }: any) {
    const { chatId } = await params;

    if (!chatId) {
        notFound();
    }

    return <ChatContent chatId={chatId} />;
}
