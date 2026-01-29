export interface Country {
  name: string;
  flag: string;
  code: string;
  region?: string;
}

export const COUNTRIES: Country[] = [
  // Southern Africa
  { name: "Zimbabwe", flag: "🇿🇼", code: "ZW", region: "Southern Africa" },
  { name: "South Africa", flag: "🇿🇦", code: "ZA", region: "Southern Africa" },
  { name: "Botswana", flag: "🇧🇼", code: "BW", region: "Southern Africa" },
  { name: "Zambia", flag: "🇿🇲", code: "ZM", region: "Southern Africa" },
  { name: "Namibia", flag: "🇳🇦", code: "NA", region: "Southern Africa" },
  { name: "Malawi", flag: "🇲🇼", code: "MW", region: "Southern Africa" },
  { name: "Mozambique", flag: "🇲🇿", code: "MZ", region: "Southern Africa" },
  { name: "Lesotho", flag: "🇱🇸", code: "LS", region: "Southern Africa" },
  { name: "Eswatini", flag: "🇸🇿", code: "SZ", region: "Southern Africa" },
  { name: "Angola", flag: "🇦🇴", code: "AO", region: "Southern Africa" },

  // East Africa
  { name: "Kenya", flag: "🇰🇪", code: "KE", region: "East Africa" },
  { name: "Tanzania", flag: "🇹🇿", code: "TZ", region: "East Africa" },
  { name: "Uganda", flag: "🇺🇬", code: "UG", region: "East Africa" },
  { name: "Rwanda", flag: "🇷🇼", code: "RW", region: "East Africa" },
  { name: "Burundi", flag: "🇧🇮", code: "BI", region: "East Africa" },
  { name: "Ethiopia", flag: "🇪🇹", code: "ET", region: "East Africa" },
  { name: "Somalia", flag: "🇸🇴", code: "SO", region: "East Africa" },
  { name: "Djibouti", flag: "🇩🇯", code: "DJ", region: "East Africa" },
  { name: "Eritrea", flag: "🇪🇷", code: "ER", region: "East Africa" },
  { name: "South Sudan", flag: "🇸🇸", code: "SS", region: "East Africa" },

  // West Africa
  { name: "Nigeria", flag: "🇳🇬", code: "NG", region: "West Africa" },
  { name: "Ghana", flag: "🇬🇭", code: "GH", region: "West Africa" },
  { name: "Senegal", flag: "🇸🇳", code: "SN", region: "West Africa" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", code: "CI", region: "West Africa" },
  { name: "Cameroon", flag: "🇨🇲", code: "CM", region: "West Africa" },
  { name: "Mali", flag: "🇲🇱", code: "ML", region: "West Africa" },
  { name: "Burkina Faso", flag: "🇧🇫", code: "BF", region: "West Africa" },
  { name: "Niger", flag: "🇳🇪", code: "NE", region: "West Africa" },
  { name: "Guinea", flag: "🇬🇳", code: "GN", region: "West Africa" },
  { name: "Benin", flag: "🇧🇯", code: "BJ", region: "West Africa" },
  { name: "Togo", flag: "🇹🇬", code: "TG", region: "West Africa" },
  { name: "Sierra Leone", flag: "🇸🇱", code: "SL", region: "West Africa" },
  { name: "Liberia", flag: "🇱🇷", code: "LR", region: "West Africa" },
  { name: "Mauritania", flag: "🇲🇷", code: "MR", region: "West Africa" },
  { name: "Gambia", flag: "🇬🇲", code: "GM", region: "West Africa" },
  { name: "Guinea-Bissau", flag: "🇬🇼", code: "GW", region: "West Africa" },
  { name: "Cape Verde", flag: "🇨🇻", code: "CV", region: "West Africa" },

  // Central Africa
  { name: "Democratic Republic of the Congo", flag: "🇨🇩", code: "CD", region: "Central Africa" },
  { name: "Republic of the Congo", flag: "🇨🇬", code: "CG", region: "Central Africa" },
  { name: "Gabon", flag: "🇬🇦", code: "GA", region: "Central Africa" },
  { name: "Chad", flag: "🇹🇩", code: "TD", region: "Central Africa" },
  { name: "Central African Republic", flag: "🇨🇫", code: "CF", region: "Central Africa" },
  { name: "Equatorial Guinea", flag: "🇬🇶", code: "GQ", region: "Central Africa" },
  { name: "São Tomé and Príncipe", flag: "🇸🇹", code: "ST", region: "Central Africa" },

  // North Africa
  { name: "Egypt", flag: "🇪🇬", code: "EG", region: "North Africa" },
  { name: "Morocco", flag: "🇲🇦", code: "MA", region: "North Africa" },
  { name: "Algeria", flag: "🇩🇿", code: "DZ", region: "North Africa" },
  { name: "Tunisia", flag: "🇹🇳", code: "TN", region: "North Africa" },
  { name: "Libya", flag: "🇱🇾", code: "LY", region: "North Africa" },
  { name: "Sudan", flag: "🇸🇩", code: "SD", region: "North Africa" },

  // Island Nations (Africa)
  { name: "Madagascar", flag: "🇲🇬", code: "MG", region: "Island Nations" },
  { name: "Mauritius", flag: "🇲🇺", code: "MU", region: "Island Nations" },
  { name: "Seychelles", flag: "🇸🇨", code: "SC", region: "Island Nations" },
  { name: "Comoros", flag: "🇰🇲", code: "KM", region: "Island Nations" },

  // Europe - Western
  { name: "United Kingdom", flag: "🇬🇧", code: "GB", region: "Western Europe" },
  { name: "France", flag: "🇫🇷", code: "FR", region: "Western Europe" },
  { name: "Germany", flag: "🇩🇪", code: "DE", region: "Western Europe" },
  { name: "Italy", flag: "🇮🇹", code: "IT", region: "Southern Europe" },
  { name: "Spain", flag: "🇪🇸", code: "ES", region: "Southern Europe" },
  { name: "Portugal", flag: "🇵🇹", code: "PT", region: "Southern Europe" },
  { name: "Netherlands", flag: "🇳🇱", code: "NL", region: "Western Europe" },
  { name: "Belgium", flag: "🇧🇪", code: "BE", region: "Western Europe" },
  { name: "Switzerland", flag: "🇨🇭", code: "CH", region: "Western Europe" },
  { name: "Austria", flag: "🇦🇹", code: "AT", region: "Western Europe" },
  { name: "Luxembourg", flag: "🇱🇺", code: "LU", region: "Western Europe" },
  { name: "Ireland", flag: "🇮🇪", code: "IE", region: "Western Europe" },
  { name: "Monaco", flag: "🇲🇨", code: "MC", region: "Western Europe" },

  // Europe - Northern
  { name: "Sweden", flag: "🇸🇪", code: "SE", region: "Northern Europe" },
  { name: "Norway", flag: "🇳🇴", code: "NO", region: "Northern Europe" },
  { name: "Denmark", flag: "🇩🇰", code: "DK", region: "Northern Europe" },
  { name: "Finland", flag: "🇫🇮", code: "FI", region: "Northern Europe" },
  { name: "Iceland", flag: "🇮🇸", code: "IS", region: "Northern Europe" },

  // Europe - Southern
  { name: "Greece", flag: "🇬🇷", code: "GR", region: "Southern Europe" },
  { name: "Croatia", flag: "🇭🇷", code: "HR", region: "Southern Europe" },
  { name: "Slovenia", flag: "🇸🇮", code: "SI", region: "Southern Europe" },
  { name: "Malta", flag: "🇲🇹", code: "MT", region: "Southern Europe" },
  { name: "Cyprus", flag: "🇨🇾", code: "CY", region: "Southern Europe" },
  { name: "Albania", flag: "🇦🇱", code: "AL", region: "Southern Europe" },
  { name: "North Macedonia", flag: "🇲🇰", code: "MK", region: "Southern Europe" },
  { name: "Montenegro", flag: "🇲🇪", code: "ME", region: "Southern Europe" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", code: "BA", region: "Southern Europe" },
  { name: "Serbia", flag: "🇷🇸", code: "RS", region: "Southern Europe" },

  // Europe - Eastern
  { name: "Poland", flag: "🇵🇱", code: "PL", region: "Eastern Europe" },
  { name: "Czech Republic", flag: "🇨🇿", code: "CZ", region: "Eastern Europe" },
  { name: "Slovakia", flag: "🇸🇰", code: "SK", region: "Eastern Europe" },
  { name: "Hungary", flag: "🇭🇺", code: "HU", region: "Eastern Europe" },
  { name: "Romania", flag: "🇷🇴", code: "RO", region: "Eastern Europe" },
  { name: "Bulgaria", flag: "🇧🇬", code: "BG", region: "Eastern Europe" },
  { name: "Ukraine", flag: "🇺🇦", code: "UA", region: "Eastern Europe" },
  { name: "Belarus", flag: "🇧🇾", code: "BY", region: "Eastern Europe" },
  { name: "Moldova", flag: "🇲🇩", code: "MD", region: "Eastern Europe" },
  { name: "Lithuania", flag: "🇱🇹", code: "LT", region: "Eastern Europe" },
  { name: "Latvia", flag: "🇱🇻", code: "LV", region: "Eastern Europe" },
  { name: "Estonia", flag: "🇪🇪", code: "EE", region: "Eastern Europe" },

  // Europe - Other
  { name: "Russia", flag: "🇷🇺", code: "RU", region: "Eastern Europe" },
  { name: "Turkey", flag: "🇹🇷", code: "TR", region: "Western Asia" },

  // Americas - North America
  { name: "United States", flag: "🇺🇸", code: "US", region: "North America" },
  { name: "Canada", flag: "🇨🇦", code: "CA", region: "North America" },
  { name: "Mexico", flag: "🇲🇽", code: "MX", region: "North America" },

  // Americas - Central America
  { name: "Guatemala", flag: "🇬🇹", code: "GT", region: "Central America" },
  { name: "Honduras", flag: "🇭🇳", code: "HN", region: "Central America" },
  { name: "El Salvador", flag: "🇸🇻", code: "SV", region: "Central America" },
  { name: "Nicaragua", flag: "🇳🇮", code: "NI", region: "Central America" },
  { name: "Costa Rica", flag: "🇨🇷", code: "CR", region: "Central America" },
  { name: "Panama", flag: "🇵🇦", code: "PA", region: "Central America" },
  { name: "Belize", flag: "🇧🇿", code: "BZ", region: "Central America" },

  // Americas - Caribbean
  { name: "Cuba", flag: "🇨🇺", code: "CU", region: "Caribbean" },
  { name: "Jamaica", flag: "🇯🇲", code: "JM", region: "Caribbean" },
  { name: "Dominican Republic", flag: "🇩🇴", code: "DO", region: "Caribbean" },
  { name: "Haiti", flag: "🇭🇹", code: "HT", region: "Caribbean" },
  { name: "Trinidad and Tobago", flag: "🇹🇹", code: "TT", region: "Caribbean" },
  { name: "Bahamas", flag: "🇧🇸", code: "BS", region: "Caribbean" },
  { name: "Barbados", flag: "🇧🇧", code: "BB", region: "Caribbean" },
  { name: "Saint Lucia", flag: "🇱🇨", code: "LC", region: "Caribbean" },
  { name: "Grenada", flag: "🇬🇩", code: "GD", region: "Caribbean" },
  { name: "Saint Vincent and the Grenadines", flag: "🇻🇨", code: "VC", region: "Caribbean" },
  { name: "Antigua and Barbuda", flag: "🇦🇬", code: "AG", region: "Caribbean" },
  { name: "Dominica", flag: "🇩🇲", code: "DM", region: "Caribbean" },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳", code: "KN", region: "Caribbean" },

  // Americas - South America
  { name: "Brazil", flag: "🇧🇷", code: "BR", region: "South America" },
  { name: "Argentina", flag: "🇦🇷", code: "AR", region: "South America" },
  { name: "Chile", flag: "🇨🇱", code: "CL", region: "South America" },
  { name: "Colombia", flag: "🇨🇴", code: "CO", region: "South America" },
  { name: "Peru", flag: "🇵🇪", code: "PE", region: "South America" },
  { name: "Venezuela", flag: "🇻🇪", code: "VE", region: "South America" },
  { name: "Ecuador", flag: "🇪🇨", code: "EC", region: "South America" },
  { name: "Bolivia", flag: "🇧🇴", code: "BO", region: "South America" },
  { name: "Paraguay", flag: "🇵🇾", code: "PY", region: "South America" },
  { name: "Uruguay", flag: "🇺🇾", code: "UY", region: "South America" },
  { name: "Guyana", flag: "🇬🇾", code: "GY", region: "South America" },
  { name: "Suriname", flag: "🇸🇷", code: "SR", region: "South America" },

  // Asia - East Asia
  { name: "China", flag: "🇨🇳", code: "CN", region: "East Asia" },
  { name: "Japan", flag: "🇯🇵", code: "JP", region: "East Asia" },
  { name: "South Korea", flag: "🇰🇷", code: "KR", region: "East Asia" },
  { name: "North Korea", flag: "🇰🇵", code: "KP", region: "East Asia" },
  { name: "Mongolia", flag: "🇲🇳", code: "MN", region: "East Asia" },
  { name: "Taiwan", flag: "🇹🇼", code: "TW", region: "East Asia" },
  { name: "Hong Kong", flag: "🇭🇰", code: "HK", region: "East Asia" },
  { name: "Macau", flag: "🇲🇴", code: "MO", region: "East Asia" },

  // Asia - Southeast Asia
  { name: "Indonesia", flag: "🇮🇩", code: "ID", region: "Southeast Asia" },
  { name: "Thailand", flag: "🇹🇭", code: "TH", region: "Southeast Asia" },
  { name: "Vietnam", flag: "🇻🇳", code: "VN", region: "Southeast Asia" },
  { name: "Philippines", flag: "🇵🇭", code: "PH", region: "Southeast Asia" },
  { name: "Malaysia", flag: "🇲🇾", code: "MY", region: "Southeast Asia" },
  { name: "Singapore", flag: "🇸🇬", code: "SG", region: "Southeast Asia" },
  { name: "Myanmar", flag: "🇲🇲", code: "MM", region: "Southeast Asia" },
  { name: "Cambodia", flag: "🇰🇭", code: "KH", region: "Southeast Asia" },
  { name: "Laos", flag: "🇱🇦", code: "LA", region: "Southeast Asia" },
  { name: "Brunei", flag: "🇧🇳", code: "BN", region: "Southeast Asia" },
  { name: "Timor-Leste", flag: "🇹🇱", code: "TL", region: "Southeast Asia" },

  // Asia - South Asia
  { name: "India", flag: "🇮🇳", code: "IN", region: "South Asia" },
  { name: "Pakistan", flag: "🇵🇰", code: "PK", region: "South Asia" },
  { name: "Bangladesh", flag: "🇧🇩", code: "BD", region: "South Asia" },
  { name: "Sri Lanka", flag: "🇱🇰", code: "LK", region: "South Asia" },
  { name: "Nepal", flag: "🇳🇵", code: "NP", region: "South Asia" },
  { name: "Bhutan", flag: "🇧🇹", code: "BT", region: "South Asia" },
  { name: "Maldives", flag: "🇲🇻", code: "MV", region: "South Asia" },
  { name: "Afghanistan", flag: "🇦🇫", code: "AF", region: "South Asia" },

  // Asia - Central Asia
  { name: "Kazakhstan", flag: "🇰🇿", code: "KZ", region: "Central Asia" },
  { name: "Uzbekistan", flag: "🇺🇿", code: "UZ", region: "Central Asia" },
  { name: "Turkmenistan", flag: "🇹🇲", code: "TM", region: "Central Asia" },
  { name: "Kyrgyzstan", flag: "🇰🇬", code: "KG", region: "Central Asia" },
  { name: "Tajikistan", flag: "🇹🇯", code: "TJ", region: "Central Asia" },

  // Middle East
  { name: "United Arab Emirates", flag: "🇦🇪", code: "AE", region: "Middle East" },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "SA", region: "Middle East" },
  { name: "Israel", flag: "🇮🇱", code: "IL", region: "Middle East" },
  { name: "Jordan", flag: "🇯🇴", code: "JO", region: "Middle East" },
  { name: "Lebanon", flag: "🇱🇧", code: "LB", region: "Middle East" },
  { name: "Syria", flag: "🇸🇾", code: "SY", region: "Middle East" },
  { name: "Iraq", flag: "🇮🇶", code: "IQ", region: "Middle East" },
  { name: "Iran", flag: "🇮🇷", code: "IR", region: "Middle East" },
  { name: "Kuwait", flag: "🇰🇼", code: "KW", region: "Middle East" },
  { name: "Qatar", flag: "🇶🇦", code: "QA", region: "Middle East" },
  { name: "Bahrain", flag: "🇧🇭", code: "BH", region: "Middle East" },
  { name: "Oman", flag: "🇴🇲", code: "OM", region: "Middle East" },
  { name: "Yemen", flag: "🇾🇪", code: "YE", region: "Middle East" },
  { name: "Palestine", flag: "🇵🇸", code: "PS", region: "Middle East" },
  { name: "Armenia", flag: "🇦🇲", code: "AM", region: "Middle East" },
  { name: "Azerbaijan", flag: "🇦🇿", code: "AZ", region: "Middle East" },
  { name: "Georgia", flag: "🇬🇪", code: "GE", region: "Middle East" },

  // Oceania
  { name: "Australia", flag: "🇦🇺", code: "AU", region: "Oceania" },
  { name: "New Zealand", flag: "🇳🇿", code: "NZ", region: "Oceania" },
  { name: "Papua New Guinea", flag: "🇵🇬", code: "PG", region: "Oceania" },
  { name: "Fiji", flag: "🇫🇯", code: "FJ", region: "Oceania" },
  { name: "Solomon Islands", flag: "🇸🇧", code: "SB", region: "Oceania" },
  { name: "Vanuatu", flag: "🇻🇺", code: "VU", region: "Oceania" },
  { name: "Samoa", flag: "🇼🇸", code: "WS", region: "Oceania" },
  { name: "Tonga", flag: "🇹🇴", code: "TO", region: "Oceania" },
  { name: "Kiribati", flag: "🇰🇮", code: "KI", region: "Oceania" },
  { name: "Micronesia", flag: "🇫🇲", code: "FM", region: "Oceania" },
  { name: "Marshall Islands", flag: "🇲🇭", code: "MH", region: "Oceania" },
  { name: "Palau", flag: "🇵🇼", code: "PW", region: "Oceania" },
  { name: "Nauru", flag: "🇳🇷", code: "NR", region: "Oceania" },
  { name: "Tuvalu", flag: "🇹🇻", code: "TV", region: "Oceania" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Zimbabwe

// Helper function to get countries by region
export const getCountriesByRegion = (region: string): Country[] => {
  return COUNTRIES.filter(country => country.region === region);
};

// Helper function to get all unique regions
export const getAllRegions = (): string[] => {
  return Array.from(new Set(COUNTRIES.map(c => c.region).filter(Boolean))) as string[];
};

// Helper function to search countries
export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase();
  return COUNTRIES.filter(
    country =>
      country.name.toLowerCase().includes(lowercaseQuery) ||
      country.code.toLowerCase().includes(lowercaseQuery)
  );
};