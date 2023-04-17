import axios from "axios";
import { Addresses } from "../entity/Addresses";

export const coordinatesToAddress = async (latitude: number, longitude: number) => {
  const response = await axios.get(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);

  if (response.status != 200 || !response.data.address) {
    console.log("Failed to get address from coordinates");
    return null;
  }

  const { data } = response;

  const placeTypes: string[] = ["shop", "amenity", "building", "leisure", "tourism", "historic", "man_made", "aeroway", "military", "office", "highway"];

  let street = "";

  if (data.address.house_number) {
    street += data.address.house_number;
  }

  street = placeTypes.filter(type => data.address[type]).map(type => data.address[type]).join('') + street;

  return {
    address_street: street !== "" ? street : null,
    address_city: (data.address.city || (data.address.town || null)),
    address_county: data.address.county,
    address_postal_code: data.address.postcode || null,
    address_latitude: latitude,
    address_longitude: longitude
  } as Addresses
}