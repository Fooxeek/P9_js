export default () => {
  return `
      <div class="page-div">
        ...
                <form class="form-signin" data-testid="form-employee">
                  <h2 class="h3 mb-3 font-weight-normal">Employé</h1>
                  <label for="employeeEmailInput">Votre email</label>
                  <input type="email" id="employeeEmailInput" data-testid="employee-email-input" class="form-control" placeholder="johndoe@email.com" required autofocus>
                  <label for="employeePasswordInput">Mot de passe</label>
                  <input type="password" id="employeePasswordInput" data-testid="employee-password-input" class="form-control" placeholder="******" autocomplete="current-password" required>
                  <button class="btn btn-lg btn-primary btn-block" data-testid="employee-login-button" style="background-color: #0E5AE5;" type="submit">Se connecter</button>
                </form>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card">
              <div class="card-body">
                <form class="form-signin" data-testid="form-admin">
                  <h2 class="h3 mb-3 font-weight-normal">Administration</h1>
                  <label for="adminEmailInput">Votre email</label>
                  <input type="email" id="adminEmailInput" data-testid="admin-email-input" class="form-control" placeholder="johndoe@email.com" required autofocus>
                  <label for="adminPasswordInput">Mot de passe</label>
                  <input type="password" id="adminPasswordInput" data-testid="admin-password-input" class="form-control" placeholder="******" autocomplete="current-password" required>
                  <button type="submit" class="btn btn-lg btn-primary btn-block" data-testid="admin-login-button" style="background-color: #0E5AE5;">Se connecter</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  `;
};
