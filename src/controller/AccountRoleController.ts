

import { AppDataSource } from "../data-source";
import { AccountRoles } from "../entity/AccountRoles";


export class AccountRolesController {

  private static userRepository = AppDataSource.getRepository(AccountRoles)

  public static async add_default_roles() {

    const roles = [
      { id: 1, role_name: "User", role_weight: 100 }, // User is a member of the general public who can report issues in their local council
      { id: 2, role_name: "Employee", role_weight: 200 }, // Employee is a maintenance worker who can view their assigned work, add updates to their assigned work, and mark their assigned work as complete
      { id: 3, role_name: "Manager", role_weight: 300 }, // Manager is a manager who verifies submitted reports, assigns work to maintenance workers, and approves maintenance work
      { id: 4, role_name: "Administrator", role_weight: 400 } // Administrator is a manager who can add and remove users, and assign roles to users
    ];


    if (await this.userRepository.count() === 0) {

      roles.forEach(async (role) => {
        const accountRole = new AccountRoles();
        accountRole.role_name = role.role_name;
        accountRole.role_weight = role.role_weight;

        await this.userRepository.save(accountRole);
      });
    }

  }
}