interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-cyan-400/50 rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-purple-100">
      <div className="text-3xl text-purple-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-white">{description}</p>
    </div>
);

export default FeatureCard;