import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';

class SyncFab extends StatefulWidget {
  const SyncFab({
    super.key,
    required this.onSync,
    this.isSyncing = false,
  });

  final VoidCallback onSync;
  final bool isSyncing;

  @override
  State<SyncFab> createState() => _SyncFabState();
}

class _SyncFabState extends State<SyncFab> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    );
  }

  @override
  void didUpdateWidget(SyncFab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSyncing) {
      _controller.repeat();
    } else {
      _controller.stop();
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.small(
      onPressed: widget.isSyncing ? null : widget.onSync,
      backgroundColor: widget.isSyncing ? AppColors.muted : AppColors.accent,
      tooltip: 'Sync',
      child: RotationTransition(
        turns: _controller,
        child: const Icon(Icons.sync, color: Colors.white, size: 20),
      ),
    );
  }
}
