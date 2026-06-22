import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class LocalStorage {
  static late Box _settingsBox;
  static late Box _cacheBox;
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<void> init() async {
    _settingsBox = await Hive.openBox('settings');
    _cacheBox = await Hive.openBox('cache');
  }

  // Secure storage for tokens
  static Future<void> setAccessToken(String token) async {
    await _secureStorage.write(key: 'access_token', value: token);
  }

  static Future<String?> getAccessToken() async {
    return _secureStorage.read(key: 'access_token');
  }

  static Future<void> setRefreshToken(String token) async {
    await _secureStorage.write(key: 'refresh_token', value: token);
  }

  static Future<String?> getRefreshToken() async {
    return _secureStorage.read(key: 'refresh_token');
  }

  static Future<void> clearTokens() async {
    await _secureStorage.delete(key: 'access_token');
    await _secureStorage.delete(key: 'refresh_token');
  }

  // Settings
  static String getLocale() {
    return _settingsBox.get('locale', defaultValue: 'uz');
  }

  static Future<void> setLocale(String locale) async {
    await _settingsBox.put('locale', locale);
  }

  static bool isDarkMode() {
    return _settingsBox.get('dark_mode', defaultValue: false);
  }

  static Future<void> setDarkMode(bool value) async {
    await _settingsBox.put('dark_mode', value);
  }

  static bool isFirstLaunch() {
    return _settingsBox.get('first_launch', defaultValue: true);
  }

  static Future<void> setFirstLaunch(bool value) async {
    await _settingsBox.put('first_launch', value);
  }

  // Cache
  static Future<void> cacheData(String key, dynamic data) async {
    await _cacheBox.put(key, data);
    await _cacheBox.put('${key}_timestamp', DateTime.now().millisecondsSinceEpoch);
  }

  static dynamic getCachedData(String key, {Duration maxAge = const Duration(minutes: 30)}) {
    final timestamp = _cacheBox.get('${key}_timestamp');
    if (timestamp == null) return null;

    final age = DateTime.now().millisecondsSinceEpoch - (timestamp as int);
    if (age > maxAge.inMilliseconds) return null;

    return _cacheBox.get(key);
  }

  static Future<void> clearCache() async {
    await _cacheBox.clear();
  }

  static Future<void> clearAll() async {
    await clearTokens();
    await _settingsBox.clear();
    await _cacheBox.clear();
  }
}
