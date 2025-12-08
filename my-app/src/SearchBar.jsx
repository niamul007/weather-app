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
      className="
        flex-grow p-3 rounded-xl 
        bg-white/10 text-white placeholder-gray-300 
        border border-gray-500 
        focus:outline-none 
        focus:border-amber-400 focus:ring-2 focus:ring-amber-400 
        transition duration-150 shadow-xl
      "
    />
    
    {/* Search Button: Amber/Orange Gradient */}
    <button
      onClick={onSearch}
      className="p-3 text-white rounded-xl shadow-lg transition duration-200 cursor-pointer 
                 bg-gradient-to-r from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700"
      title="Search City"
    >
      <Search className="w-6 h-6" />
    </button>
    
    {/* Geolocation Button: Amber/Orange Gradient */}
    <button
      onClick={onGeolocation}
      className="p-3 text-white rounded-xl shadow-lg transition duration-200 cursor-pointer
                 bg-gradient-to-r from-amber-600 to-orange-800 hover:from-amber-500 hover:to-orange-700"
      title="Use Current Location"
    >
      {/* MapPin is already an icon and will use the button's white text color */}
      <MapPin className="w-6 h-6" />
    </button>
</div>
);

export default SearchBar;
