import axios from 'axios';

const BASE_URL = 'https://sandbox-api.softpoint.io/interface/v1';
const API_KEY = 's1g8dwdunjcpqyELJMu0WsanpfXnCBcdzfWNOugvW68='; 

export interface Country {
  id: string;
  name: string;
  calling_code: string;
  phone_length: string;
  [key: string]: string
}

export const getToken = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/access_token?corporate_id=10`, null, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Api-Key': API_KEY,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

export const getCountries = async (): Promise<{ [key: string]: Country }> => {
  try {
    const response = await axios.get<{ [key: string]: Country }>(`${BASE_URL}/challenges/countries`, {
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const submitTwoFactorAuth = async (phone_number: string, country_id: string,access_token:any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/challenges/two_factor_auth`,
      { phone_number, country_id },
      {
        headers: {
          Authorization:  access_token},
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error during two-factor authentication:', error);
    throw error;
  }
};
