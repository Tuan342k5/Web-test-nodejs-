import * as userRepository from "../users/user.repository.js";

export async function findByEmail(email) {
  return userRepository.findByEmail(email);
}

export async function findById(id) {
  return userRepository.findById(id);
}

export async function findOrCreateSSOUser(data) {
  return userRepository.findOrCreateSSOUser(data);
}

