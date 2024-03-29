

import { AppDataSource } from "../data-source";
import { AccountRoles } from "../entity/AccountRoles";


export class AccountRolesController {

  private static userRepository = AppDataSource.getRepository(AccountRoles)

  public static async add_default_roles() {

    const roles: AccountRoles[] = [
      { id: 1, role_name: "User" }, // User is a member of the general public who can report issues in their local council
      { id: 2, role_name: "Employee" }, // Employee is a maintenance worker who can view their assigned work, add updates to their assigned work, and mark their assigned work as complete
      { id: 3, role_name: "Manager" }, // Manager is a manager who verifies submitted reports, assigns work to maintenance workers, and approves maintenance work
      { id: 4, role_name: "Administrator" } // Administrator is a manager who can add and remove users, and assign roles to users
    ];




    if (await this.userRepository.count() === 0) {
      console.warn("No roles found in database, adding default roles")
      await this.userRepository.save(roles);

    }

  }
}