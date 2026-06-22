import '../../../../core/storage/local_storage.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/auth_response.dart';
import '../models/user_model.dart';

class AuthRepository {
  final AuthRemoteDatasource _remoteDatasource;

  AuthRepository(this._remoteDatasource);

  Future<UserModel> login(String email, String password) async {
    final response = await _remoteDatasource.login(email, password);
    await _saveTokens(response);
    return response.user;
  }

  Future<UserModel> register(Map<String, dynamic> data) async {
    final response = await _remoteDatasource.register(data);
    await _saveTokens(response);
    return response.user;
  }

  Future<UserModel> getMe() async {
    return _remoteDatasource.getMe();
  }

  Future<void> logout() async {
    try {
      await _remoteDatasource.logout();
    } finally {
      await LocalStorage.clearTokens();
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await LocalStorage.getAccessToken();
    return token != null;
  }

  Future<void> _saveTokens(AuthResponse response) async {
    await LocalStorage.setAccessToken(response.accessToken);
    await LocalStorage.setRefreshToken(response.refreshToken);
  }
}
