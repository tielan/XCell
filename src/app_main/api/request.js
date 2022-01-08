import axios from "axios";

export function postJson(url, data, config) {
  return axios.post(url, data, config);
}

export function getJson(url, config) {
  return axios.get(url, config);
}
