import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import 'sidebar_nav.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.dark,
      child: SafeArea(
        child: SidebarNav(
          onItemTap: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }
}
