import CrmLoginForm from "@/components/crm/CrmLoginForm";

export default function CrmLoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Bira CRM</h2>
                    <p className="mt-2 text-sm text-neutral-400">Sign in to manage WhatsApp conversations</p>
                </div>
                <CrmLoginForm />
            </div>
        </div>
    );
}
