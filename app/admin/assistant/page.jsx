import AssistantChatClient from "@/components/admin/assistant/AssistantChatClient";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "GoCart. - AI Co-pilot Assistant",
    description: "GoCart. - AI Co-pilot Assistant",
};

export default function AssistantPage() {
    return <AssistantChatClient />;
}
