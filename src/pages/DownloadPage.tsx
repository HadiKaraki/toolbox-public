import DownloadCard from "../components/DownloadCard";
import windowsLogo from "../assets/windows-logo.svg";
import macLogo from "../assets/apple-logo.svg";
import linuxLogo from "../assets/linux-logo.svg";

const platforms = [
  {
    name: 'Windows',
    logo: windowsLogo,
    file: '/Toolbox Pro-Windows-1.0.0-Setup.exe',
  },
  {
    name: 'Linux',
    logo: linuxLogo,
    file: '/Toolbox Pro-Linux-1.0.0-.AppImage',
  },
  {
    name: 'Mac',
    logo: macLogo,
    file: '/Toolbox Pro-Mac-1.0.0-Installer.dmg',
  },
];

export default function DownloadPage() {
    return (
      <div className="flex flex-col md:flex-row justify-around mx-auto mt-32">
        {platforms.map((platform: { name: string; logo: string; file: string; }) => (
            <DownloadCard name={platform.name} logo={platform.logo} file={platform.file}/>
        ))}
      </div>
    )
}