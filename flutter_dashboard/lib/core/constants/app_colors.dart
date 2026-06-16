import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color accent = Color(0xFFE74C3C);
  static const Color accentDark = Color(0xFFC0392B);
  static const Color dark = Color(0xFF1A1A2E);
  static const Color text = Color(0xFF444444);
  static const Color muted = Color(0xFF888888);
  static const Color border = Color(0xFFEBEBEB);
  static const Color background = Color(0xFFF7F7F7);
  static const Color card = Color(0xFFFFFFFF);
  static const Color success = Color(0xFF27AE60);
  static const Color warning = Color(0xFFF39C12);

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          primary: accent,
          onPrimary: Colors.white,
          secondary: dark,
          onSecondary: Colors.white,
          surface: card,
          onSurface: text,
          error: accentDark,
        ),
        scaffoldBackgroundColor: background,
        cardColor: card,
        appBarTheme: const AppBarTheme(
          backgroundColor: dark,
          foregroundColor: Colors.white,
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: accent,
          foregroundColor: Colors.white,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: accent,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: accent, width: 2),
          ),
          filled: true,
          fillColor: card,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        cardTheme: CardThemeData(
          color: card,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: border),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: card,
          selectedItemColor: accent,
          unselectedItemColor: muted,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),
        dividerTheme: const DividerThemeData(
          color: border,
          thickness: 1,
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            color: dark,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
          headlineMedium: TextStyle(
            color: dark,
            fontSize: 22,
            fontWeight: FontWeight.w600,
          ),
          titleLarge: TextStyle(
            color: dark,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
          titleMedium: TextStyle(
            color: text,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
          bodyLarge: TextStyle(color: text, fontSize: 16),
          bodyMedium: TextStyle(color: text, fontSize: 14),
          bodySmall: TextStyle(color: muted, fontSize: 12),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: background,
          labelStyle: const TextStyle(color: text, fontSize: 12),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: border),
          ),
        ),
      );
}
