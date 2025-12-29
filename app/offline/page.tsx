export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-white p-4">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold mb-2">Hors connexion</h1>
      <p className="text-center text-gray-300">
        Vous êtes actuellement hors ligne. Vérifiez votre connexion internet et réessayez.
      </p>
    </div>
  );
}
