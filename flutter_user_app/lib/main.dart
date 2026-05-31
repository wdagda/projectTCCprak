import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';

void main() {
  runApp(const ITManagementApp());
}

class ITManagementApp extends StatelessWidget {
  const ITManagementApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IT Management App',
      themeMode: ThemeMode.dark, // Force dark mode to match web
      theme: ThemeData.dark(useMaterial3: true).copyWith(
        scaffoldBackgroundColor: const Color(0xFF221C1F),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF221C1F),
          foregroundColor: Color(0xFFFFB6C1),
          elevation: 0,
        ),
        cardTheme: const CardThemeData(
          color: Color(0xFF2D262A),
          elevation: 2,
        ),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFFB6C1),
          secondary: Color(0xFFF48FB1),
          surface: Color(0xFF2D262A),
          error: Color(0xFFFFB3B3),
          onPrimary: Color(0xFF221C1F),
          onSurface: Color(0xFFFFF0F5),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFFB6C1),
            foregroundColor: const Color(0xFF221C1F),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          fillColor: const Color(0xFF2D262A),
          filled: true,
          labelStyle: const TextStyle(color: Color(0xFFB3A0A8)),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF42373D)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF42373D)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFFFB6C1)),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isLoading = true;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final user = await ApiService.getUser();
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_user != null) {
      return HomeScreen(user: _user!);
    } else {
      return const LoginScreen();
    }
  }
}
