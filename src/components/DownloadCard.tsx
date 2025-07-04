interface DownloadCardProps {
  name: string;
  logo: string;
  file: string;
}

export default function DownloadCard({name, logo, file}: DownloadCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center">
        <div
          key={name}
          className="bg-white shadow-md rounded-md p-6 flex flex-col items-center w-64"
        >
          <img src={logo} alt={`${name} logo`} className="h-16 mb-4" />
          <h2 className="text-xl font-semibold mb-4">{name}</h2>
          <a
            href={file}
            download
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Download
          </a>
        </div>
    </div>
  );
}