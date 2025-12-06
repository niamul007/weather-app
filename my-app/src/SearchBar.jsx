import {
  Search,
  MapPin,
  Sunset,
  Sunrise,
  Droplet,
  Wind,
  Loader,
  Zap,
} from "lucide-react";
const SearchBar = ({ query, setQuery, onSearch, onGeolocation }) => (
  <div className="mb-8 flex space-x-2">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch()}
      placeholder="Enter city name (e.g., London, Tokyo)"
      className="flex-grow p-3 rounded-xl border-indigo-500 border border-purple-500 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition duration-150 shadow-xl"
    />
    <button
      onClick={onSearch}
      className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition duration-200 cursor-pointer"
      title="Search City"
    >
      <Search className="w-6 h-6" />
    </button>
    <button
      onClick={onGeolocation}
      className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition duration-200 cursor-pointer"
      title="Use Current Location"
    >
      <MapPin className="w-6 h-6" />
    </button>
  </div>
);

export default SearchBar;
