import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const airportSchema = new Schema({
  id: String,
  name: String,
  city: String,
  country: String,
  iata: String,
  icao: String,
  latitude: String,
  longitude: String,
  altitude: String,
  timezone: String,
  dst: String,
  tz: String,
  altNames: [String],
  paxDemand: Number,
  cargoDemand: Number,
  runwayLength: String,
  searchableName: String
});

export const AirportModel = mongoose.model('Airport', airportSchema);
