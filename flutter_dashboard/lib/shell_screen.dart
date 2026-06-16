import 'package:flutter/material.dart';

import 'core/constants/app_colors.dart';
import 'shared/widgets/sidebar_nav.dart';

/// Width (dp) at which the permanent sidebar appears.
const double kSidebarBreakpoint = 720;

/// Fixed width of the permanent sidebar.
const double kSidebarWidth = 230;

/// Root shell for GoRouter's ShellRoute.
///
/// - **Narrow** (< [kSidebarBreakpoint]): renders [child] as-is; each screen
///   manages its own [Drawer] and hamburger button.
/// - **Wide** (≥ [kSidebarBreakpoint]): renders a permanent dark sidebar on
///   the left and the screen content on the right; the hamburger is hidden.
class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= kSidebarBreakpoint) {
          return _WideLayout(child: child);
        }
        return child;
      },
    );
  }
}

class _WideLayout extends StatelessWidget {
  const _WideLayout({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Permanent sidebar
        SizedBox(
          width: kSidebarWidth,
          child: Material(
            color: AppColors.dark,
            child: SafeArea(
              right: false,
              child: SidebarNav(),
            ),
          ),
        ),
        // Vertical divider
        Container(width: 1, color: Colors.white12),
        // Main content — fills the rest
        Expanded(child: child),
      ],
    );
  }
}
