import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  final Map<String, dynamic> user;

  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Map<String, dynamic> _currentUser;
  List<dynamic> _borrowings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _currentUser = widget.user;
    _fetchBorrowings();
  }

  Future<void> _fetchBorrowings() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getUserBorrowings(_currentUser['id']);
      setState(() {
        _borrowings = list;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal memuat data: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleLogout() async {
    await ApiService.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  void _goToProfile() async {
    final updatedUser = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ProfileScreen(user: _currentUser)),
    );

    if (updatedUser != null) {
      setState(() {
        _currentUser = updatedUser;
      });
    }
  }

  String _getInitials(String name) {
    List<String> names = name.trim().split(' ');
    if (names.isEmpty) return '??';
    if (names.length == 1) return names[0][0].toUpperCase();
    return '${names[0][0]}${names.last[0]}'.toUpperCase();
  }

  Future<void> _confirmHandover(int logId) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );
      await ApiService.updateBorrowingStatus(logId, 'active');
      await ApiService.confirmHandover(logId);
      if (!mounted) return;
      Navigator.pop(context); // close dialog
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Serah terima berhasil dikonfirmasi!')),
      );
      _fetchBorrowings();
    } catch (e) {
      Navigator.pop(context); // close dialog
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _returnAsset(int logId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Kembalikan Perangkat'),
        content: const Text('Yakin ingin mengembalikan perangkat ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Ya'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => const Center(child: CircularProgressIndicator()),
        );
        await ApiService.updateBorrowingStatus(logId, 'returned');
        if (!mounted) return;
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Perangkat berhasil dikembalikan!')),
        );
        _fetchBorrowings();
      } catch (e) {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    int activeCount = _borrowings.where((b) => b['status'] == 'active').length;
    int pendingCount = _borrowings
        .where((b) => b['status'] == 'pending')
        .length;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'IT Management App',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              'Halo, ${_currentUser['name'].split(' ')[0]}',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          GestureDetector(
            onTap: _goToProfile,
            child: CircleAvatar(
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Text(
                _getInitials(_currentUser['name']),
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchBorrowings,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Card(
                      color: Theme.of(context).colorScheme.primaryContainer,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            Text(
                              '$activeCount',
                              style: Theme.of(context).textTheme.headlineMedium
                                  ?.copyWith(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onPrimaryContainer,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            Text(
                              'Dipinjam',
                              style: TextStyle(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onPrimaryContainer,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Card(
                      color: Theme.of(context).colorScheme.secondaryContainer,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            Text(
                              '$pendingCount',
                              style: Theme.of(context).textTheme.headlineMedium
                                  ?.copyWith(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSecondaryContainer,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            Text(
                              'Menunggu',
                              style: TextStyle(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSecondaryContainer,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'Daftar Perangkat Saya',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (_borrowings.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Text('Belum ada perangkat yang dipinjam.'),
                  ),
                )
              else
                ..._borrowings.map((log) {
                  final asset = log['Asset'] ?? {};
                  final status = log['status'];

                  Color statusColor = Colors.grey;
                  String statusText = 'Selesai';
                  if (status == 'pending') {
                    statusColor = Colors.orange;
                    statusText = 'Menunggu';
                  } else if (status == 'active') {
                    statusColor = Colors.green;
                    statusText = 'Aktif';
                  }

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  asset['name'] ?? 'Unknown Asset',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  statusText,
                                  style: TextStyle(
                                    color: statusColor,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Tgl Pinjam: ${log['borrow_date'] != null ? DateTime.parse(log['borrow_date']).toLocal().toString().split(' ')[0] : '-'}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                          if (log['return_date'] != null)
                            Text(
                              'Tgl Kembali: ${DateTime.parse(log['return_date']).toLocal().toString().split(' ')[0]}',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 13,
                              ),
                            ),

                          if (status == 'pending')
                            Padding(
                              padding: const EdgeInsets.only(top: 12.0),
                              child: ElevatedButton(
                                onPressed: () => _confirmHandover(log['id']),
                                child: const Text('Konfirmasi Terima'),
                              ),
                            ),
                          if (status == 'active')
                            Padding(
                              padding: const EdgeInsets.only(top: 12.0),
                              child: OutlinedButton(
                                onPressed: () => _returnAsset(log['id']),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.red,
                                  side: const BorderSide(color: Colors.red),
                                ),
                                child: const Text('Kembalikan Perangkat'),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
            ],
          ),
        ),
      ),
    );
  }
}
