import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../shell_screen.dart';

/// White app bar used by all inner screens.
/// Automatically hides the hamburger when the permanent sidebar is visible.
class LlAppBar extends StatelessWidget implements PreferredSizeWidget {
  const LlAppBar({
    super.key,
    required this.title,
    this.actions,
  });

  final String title;
  final List<Widget>? actions;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 1);

  @override
  Widget build(BuildContext context) {
    final isWide =
        MediaQuery.sizeOf(context).width >= kSidebarBreakpoint;

    return AppBar(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.dark,
      elevation: 0,
      automaticallyImplyLeading: false,
      leading: isWide
          ? null
          : Builder(
              builder: (ctx) => IconButton(
                icon: const Icon(Icons.menu, color: AppColors.dark),
                onPressed: () => Scaffold.of(ctx).openDrawer(),
              ),
            ),
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.dark,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      actions: actions,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(color: AppColors.border, height: 1),
      ),
    );
  }
}
