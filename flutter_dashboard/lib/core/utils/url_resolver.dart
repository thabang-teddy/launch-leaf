import 'dart:io';

import 'package:flutter/foundation.dart';

/// On Android, `.test` domains only exist on the host machine's hosts file
/// and can't be resolved by the emulator's DNS. This remaps the connection
/// to 10.0.2.2 (the emulator's loopback alias for the host) while returning
/// the original hostname so callers can set the correct Host header.
class UrlResolver {
  const UrlResolver._();

  static ({String url, String? hostHeader}) resolve(String url) {
    if (kIsWeb || !Platform.isAndroid) return (url: url, hostHeader: null);

    final uri = Uri.tryParse(url);
    if (uri == null || !uri.host.endsWith('.test')) {
      return (url: url, hostHeader: null);
    }

    final remapped = uri.replace(host: '10.0.2.2').toString();
    return (url: remapped, hostHeader: uri.host);
  }
}
