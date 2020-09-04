const PACKAGES = {
  D8: {
    adminTheme: {
      composer: [
        'drupal/admin_toolbar',
        'drupal/adminimal_theme',
        'drupal/adminimal_admin_toolbar'
      ],
      drush: [
        'admin_toolbar',
        // 'adminimal_theme',
        'adminimal_admin_toolbar'
      ]
    },
    devModules: {
      composer: [
        'drupal/devel:^4.0',
        'kint-php/kint',
        'drupal/devel_php',
        'drupal/diff',
        "drupal/coder",
        "drupal/config_devel",
        "drupal/config_direct_save",
        "drupal/config_filter:^1.0",
        "drupal/config_split"
      ],
      drush: [
        'devel',
        // 'kint',
        'devel_php',
        'diff',
        "config_devel",
        "config_direct_save",
        "config_filter",
        "config_split"
      ]
    },
    baseBluecadet: {
      composer: [
        'bluecadet/bc_aicc',
        'bluecadet/bluecadet_config_suite',
        'bluecadet/bluecadet_gcse',
        'bluecadet/bluecadet_redirect_importer',
        'bluecadet/bluecadet_utilities'
      ],
      drush: [
        'bc_aicc',
        'bluecadet_config_suite',
        'bluecadet_gcse',
        'bluecadet_redirect_importer',
        'bluecadet_utilities'
      ]
    },
    baseWeb: {
      composer: [
        "drupal/allowed_formats",
        "drupal/ctools",
        "drupal/entity_browser",
        "drupal/entity_embed",
        "drupal/field_group",
        "drupal/focal_point",
        "drupal/google_analytics",
        "drupal/hsts",
        "drupal/image_effects",
        // "drupal/improved_multi_select",
        "drupal/inline_entity_form",
        "drupal/linkit",
        "drupal/media_entity_browser:^2.0",
        "drupal/menu_block",
        "drupal/menu_breadcrumb",
        "drupal/menu_link_attributes",
        "drupal/metatag",
        "drupal/new_relic_rpm",
        "drupal/pantheon_advanced_page_cache",
        "drupal/paragraphs",
        "drupal/pathauto",
        "drupal/queue_ui",
        "drupal/rabbit_hole",
        "drupal/recreate_block_content",
        "drupal/redirect",
        "drupal/redis",
        "predis/predis",
        "drupal/save_edit",
        "drupal/scheduler",
        "drupal/scheduler_content_moderation_integration",
        "drupal/simple_block",
        "drupal/simple_sitemap",
        "drupal/token",
        "drupal/token_filter",
        "drupal/ultimate_cron",
        "drupal/video_embed_field",
        "drupal/video_embed_media",
        "drupal/views_ajax_history",
        "drupal/viewsreference",
        "drupal/webform"
      ],
      drush: [
        "allowed_formats",
        "ctools",
        "entity_browser",
        "entity_browser_entity_form",
        "entity_embed",
        "field_group",
        "focal_point",
        "google_analytics",
        "hsts",
        "image_effects",
        // "improved_multi_select",
        "inline_entity_form",
        "linkit",
        "media_entity_browser",
        "menu_block",
        "menu_breadcrumb",
        "menu_link_attributes",
        "metatag",
        "new_relic_rpm",
        "pantheon_advanced_page_cache",
        "paragraphs",
        "pathauto",
        "queue_ui",
        "rabbit_hole",
        "recreate_block_content",
        "redirect",
        "redis",
        "save_edit",
        "scheduler",
        "scheduler_content_moderation_integration",
        "simple_block",
        "simple_sitemap",
        "token",
        "token_filter",
        "ultimate_cron",
        "video_embed_field",
        "video_embed_media",
        "views_ajax_history",
        "viewsreference",
        "webform"
      ]
    },
    baseHeadless: {
      composer: [],
      drush: []
    }
  },
  WP: {
    web: {
      composer: [
        'wp-cli/wp-cli-bundle',
        'wpackagist-plugin/classic-editor',
        'wpackagist-plugin/duplicate-post',
        'wpackagist-plugin/simple-page-ordering',
        'wpackagist-plugin/redirection',
        'wpackagist-plugin/pantheon-advanced-page-cache',
        'wpackagist-plugin/wp-term-order',
        'wpackagist-plugin/wp-cfm',
        'wpackagist-plugin/timber-library',
        'bluecadet/timber-fractal-paths'
      ],
      wp_cli: [
        'classic-editor',
        'duplicate-post',
        'simple-page-ordering',
        'redirection',
        'pantheon-advanced-page-cache',
        'wp-term-order',
        'wp-cfm',
        'timber-library',
        'timber-fractal-paths'
      ]
    },
    app: {
      composer: [
        'wpackagist-plugin/classic-editor',
        'wpackagist-plugin/duplicate-post',
        'wpackagist-plugin/simple-page-ordering',
        'wpackagist-plugin/redirection',
        'wpackagist-plugin/pantheon-advanced-page-cache',
        'wpackagist-plugin/wp-term-order',
        'wpackagist-plugin/wp-cfm',
        'wpackagist-plugin/disable-blog',
        'wpackagist-plugin/disable-comments'
      ],
      wp_cli: [
        'classic-editor',
        'duplicate-post',
        'simple-page-ordering',
        'redirection',
        'pantheon-advanced-page-cache',
        'wp-term-order',
        'wp-cfm',
        'disable-blog',
        'disable-comments'
      ]
    }
  }
}

exports.PACKAGES = PACKAGES;

const INIT_UNINSTALL = {
  D8: {
    drush: [
      'big_pipe',
      'color',
      'comment',
      'quickedit',
      'rdf',
      'tour'
    ]
  }
}


exports.INIT_UNINSTALL = INIT_UNINSTALL;
