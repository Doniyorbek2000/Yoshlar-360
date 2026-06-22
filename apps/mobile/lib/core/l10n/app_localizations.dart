import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../storage/local_storage.dart';
import 'uz_translations.dart';
import 'ru_translations.dart';

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(Locale(LocalStorage.getLocale()));

  void setLocale(String languageCode) {
    LocalStorage.setLocale(languageCode);
    state = Locale(languageCode);
  }
}

class AppLocalizations {
  static const supportedLocales = [
    Locale('uz'),
    Locale('ru'),
  ];

  static const localizationsDelegates = [
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];

  static Map<String, String> _getTranslations(String locale) {
    switch (locale) {
      case 'ru':
        return ruTranslations;
      default:
        return uzTranslations;
    }
  }

  static String tr(BuildContext context, String key) {
    final locale = Localizations.localeOf(context).languageCode;
    final translations = _getTranslations(locale);
    return translations[key] ?? key;
  }
}

extension TranslationExtension on BuildContext {
  String tr(String key) => AppLocalizations.tr(this, key);
}
