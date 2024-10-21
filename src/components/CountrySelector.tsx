import React, { useState, useEffect, useRef } from 'react';
import { getCountries, submitTwoFactorAuth, Country, getToken } from '../api/softpointApi';
import './CountrySelector.css';

const CountrySelector: React.FC = () => {
  const [countries, setCountries] = useState<{ [key: string]: Country }>({});
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isValid, setValid] = useState(true);
  const [phoneLength, setPhoneLength] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [token, setToken] = useState<any>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getTokan = getToken();
    setToken(getTokan);
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);

        const countryArray = Object.entries(data)
          .map(([key, value]) => ({
            countryKey: key,
            ...value
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setFilteredCountries(countryArray);
        const defaultCountry = countryArray.find(country => country.name === 'United States');
        setSelectedCountry(defaultCountry || countryArray[0] || null);
        if (defaultCountry) {
          setPhoneLength(Number(defaultCountry.phone_length));
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);


  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPhoneLength(Number(country.phone_length));
    setDropdownOpen(false);
    validatePhoneNumber(phoneNumber, country);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (searchValue === '') {
      setFilteredCountries(Object.entries(countries)
        .map(([key, value]) => ({
          countryKey: key,
          ...value
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      );
    } else {
      const filtered = Object.values(countries).filter((country) =>
        country.name.toLowerCase().includes(searchValue)
      );
      setFilteredCountries(filtered);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCountry && phoneNumber) {
      try {
        await submitTwoFactorAuth(phoneNumber.replace(/\D/g, ''), selectedCountry.id, token);
        alert('Submitted successfully!');
        setPhoneNumber('');
        const defaultCountry = filteredCountries.find(country => country.name === 'United States');
        setSelectedCountry(defaultCountry || null);
        setPhoneLength(Number(defaultCountry?.phone_length || 0));
        setSearchTerm('');
        setValid(true);
        setErrorMessage('');
      } catch (error) {
        console.error('Error submitting two-factor auth:', error);
      }
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const validatePhoneNumber = (value: string, country: Country) => {
    const phoneLength = +country?.phone_length;
    const isValid = value.length === phoneLength;
    setValid(isValid);
    setErrorMessage(isValid ? '' : ` Please enter ${phoneLength} digits`);
    return isValid;
  };

  const formatPhoneNumber = (number: string) => {
    const sanitizedNumber = number.replace(/\D/g, '');
    const match = sanitizedNumber.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);

    if (!match) return sanitizedNumber;
    const formattedNumber = `${match[1] ? `(${match[1]}) ` : ''}${match[2]}${match[3] ? `-${match[3]}` : ''}`;

    return formattedNumber.trim();
  };

  const handleNumberChange = (value: string) => {
    const sanitizedValue = value.replace(/\D/g, '');
    const formattedValue = formatPhoneNumber(sanitizedValue);
    setPhoneNumber(formattedValue);
    validatePhoneNumber(sanitizedValue, selectedCountry!);
  };

  return (
    <div className='padding'>
    <div className="country-selector-container">
      <form onSubmit={handleSubmit} className="country-selector">
        <h2>Select Your Country</h2>

        <div className='container'>
        <div className="dropdown" ref={dropdownRef}>
          <div className="input-container">
            {selectedCountry && (
              <img
                src={`https://flagsapi.com/${selectedCountry.countryKey}/flat/32.png`}
                alt={`${selectedCountry.name} flag`}
                className="country-flag"
              />
            )}
            <input
              type="text"
              placeholder="Search country..."
              value={dropdownOpen ? searchTerm : selectedCountry?.calling_code ?? ''}
              onChange={handleSearch}
              onFocus={() => setDropdownOpen(true)}
              className="country-input"
            />
          </div>
          {dropdownOpen && (
            <ul className="country-list">
              {filteredCountries.map((country) => (
                <li key={country.id} onClick={() => handleCountrySelect(country)} className="country-item">
                  <img
                    src={`https://flagsapi.com/${country.countryKey}/flat/32.png`}
                    alt={`${country.name} flag`}
                    className="country-flag"
                  />
                  <span>{country.name} ({country.calling_code})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div  className="phone-number-input">
          <input
            type="text"
            placeholder={`(000) 000-0000`}
            value={phoneNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            maxLength={phoneLength + 4}
            className="phone-input"
          />
        </div>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>} 

        <button type="submit" className={isValid ? 'submit-button' : 'submit-disable'} disabled={!isValid}>
          Submit
        </button>
      </form>
    </div>
    </div>
  );
};

export default CountrySelector;
