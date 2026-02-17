/**
 * Home Menu Overlay - Pure jQuery Implementation
 * Easy integration into Odoo 17 without OWL framework
 * 
 * Usage:
 * 1. Include this file in your assets
 * 2. Add data-home-trigger attribute to your home button
 * 3. Call HomeMenuOverlay.init() on page load
 */

(function($) {
    'use strict';

    var HomeMenuOverlay = {
        isInitialized: false,
        isVisible: false,
        apps: [],
        filteredApps: [],
        
        /**
         * Initialize the overlay
         */
        init: function() {
            if (this.isInitialized) return;
            
            this.loadApps();
            this.createOverlay();
            this.bindEvents();
            this.isInitialized = true;
            
            console.log('Home Menu Overlay initialized');
        },

        /**
         * Load apps from Odoo menu
         */
        loadApps: function() {
            var self = this;
            
            // Try to get apps from Odoo's menu service
            if (window.odoo && window.odoo.__DEBUG__ && window.odoo.__DEBUG__.services) {
                try {
                    var menuService = window.odoo.__DEBUG__.services['menu.menu'];
                    if (menuService && menuService.getApps) {
                        var menuApps = menuService.getApps();
                        this.apps = menuApps.map(function(app, index) {
                            return {
                                id: app.id,
                                name: app.name,
                                description: app.xmlid || app.name,
                                icon: self.getAppIcon(app),
                                color: self.getAppColor(index),
                                actionID: app.actionID,
                                xmlid: app.xmlid
                            };
                        });
                    }
                } catch(e) {
                    console.warn('Could not load apps from menu service:', e);
                }
            }
            
            // Fallback: parse from existing menu
            if (this.apps.length === 0) {
                this.apps = this.parseAppsFromDOM();
            }
            
            this.filteredApps = this.apps;
        },

        /**
         * Parse apps from existing DOM menu
         */
        parseAppsFromDOM: function() {
            var self = this;
            var apps = [];
            var index = 0;
            
            // Look for menu items in the navbar
            $('.o_menu_sections .dropdown-item, .o_menu_apps .o_app').each(function() {
                var $item = $(this);
                var name = $item.text().trim();
                var actionId = $item.data('menu-xmlid') || $item.data('action-id');
                
                if (name) {
                    apps.push({
                        id: actionId || 'app_' + index,
                        name: name,
                        description: name,
                        icon: self.extractIconClass($item),
                        color: self.getAppColor(index),
                        actionID: actionId,
                        element: $item
                    });
                    index++;
                }
            });
            
            // If still no apps, create sample data for demo
            if (apps.length === 0) {
                apps = this.getSampleApps();
            }
            
            return apps;
        },

        /**
         * Extract icon class from menu item
         */
        extractIconClass: function($element) {
            var $icon = $element.find('i, .fa, .oi');
            if ($icon.length > 0) {
                var classes = $icon.attr('class');
                if (classes) {
                    return classes;
                }
            }
            return 'fa fa-th-large';
        },

        /**
         * Get sample apps for demo/fallback
         */
        getSampleApps: function() {
            var apps = [
                { name: 'Discuss', icon: 'fa fa-comments', description: 'Team Communication' },
                { name: 'Sales', icon: 'fa fa-shopping-cart', description: 'Sales Management' },
                { name: 'Dashboards', icon: 'fa fa-chart-line', description: 'Analytics Dashboard' },
                { name: 'Inventory', icon: 'fa fa-cubes', description: 'Warehouse Management' },
                { name: 'Purchase', icon: 'fa fa-shopping-basket', description: 'Purchase Orders' },
                { name: 'Accounting', icon: 'fa fa-calculator', description: 'Financial Management' },
                { name: 'Employees', icon: 'fa fa-users', description: 'HR Management' },
                { name: 'Website', icon: 'fa fa-globe', description: 'Website Builder' }
            ];
            
            return apps.map(function(app, index) {
                return {
                    id: 'sample_' + index,
                    name: app.name,
                    description: app.description,
                    icon: app.icon,
                    color: HomeMenuOverlay.getAppColor(index),
                    actionID: null
                };
            });
        },

        /**
         * Get icon for app
         */
        getAppIcon: function(app) {
            var iconMap = {
                'Sales': 'fa fa-shopping-cart',
                'Inventory': 'fa fa-cubes',
                'Purchase': 'fa fa-shopping-basket',
                'Accounting': 'fa fa-calculator',
                'CRM': 'fa fa-handshake',
                'Project': 'fa fa-tasks',
                'Manufacturing': 'fa fa-industry',
                'Website': 'fa fa-globe',
                'Employees': 'fa fa-users',
                'Dashboards': 'fa fa-chart-line',
                'Discuss': 'fa fa-comments',
                'Settings': 'fa fa-cog',
                'Leave': 'fa fa-calendar-check',
                'Payment': 'fa fa-credit-card',
                'Employee': 'fa fa-user-tie',
                'Vehicle': 'fa fa-car',
                'Material': 'fa fa-clipboard-list',
                'Procurement': 'fa fa-shopping-bag',
                'Cash': 'fa fa-money-bill-wave'
            };
            
            var appName = app.name || '';
            for (var key in iconMap) {
                if (appName.includes(key)) {
                    return iconMap[key];
                }
            }
            
            return 'fa fa-th-large';
        },

        /**
         * Get color gradient for app
         */
        getAppColor: function(index) {
            var colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
                'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                'linear-gradient(135deg, #f77062 0%, #fe5196 100%)'
            ];
            
            return colors[index % colors.length];
        },

        /**
         * Create overlay HTML
         */
        createOverlay: function() {
            var overlayHTML = `
                <div class="home-menu-overlay" id="homeMenuOverlay">
                    <div class="overlay-backdrop"></div>
                    <div class="overlay-content">
                        <div class="overlay-header">
                            <button class="btn-back" id="overlayBackBtn">
                                <i class="fa fa-arrow-left"></i>
                                <span>Back</span>
                            </button>
                            <h2 class="overlay-title">ERP Applications</h2>
                            <div class="header-actions">
                                <input type="text" class="search-apps" id="searchApps" placeholder="Search applications..." />
                            </div>
                        </div>
                        <div class="apps-grid-container">
                            <div class="apps-grid" id="appsGrid"></div>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(overlayHTML);
            this.renderApps();
        },

        /**
         * Render apps grid
         */
        renderApps: function() {
            var $grid = $('#appsGrid');
            $grid.empty();
            
            if (this.filteredApps.length === 0) {
                $grid.append(`
                    <div class="apps-empty-state">
                        <i class="fa fa-search"></i>
                        <h3>No applications found</h3>
                        <p>Try adjusting your search query</p>
                    </div>
                `);
                return;
            }
            
            this.filteredApps.forEach(function(app) {
                var $card = $(`
                    <div class="app-card" data-app-id="${app.id}">
                        <div class="app-icon" style="background: ${app.color}">
                            <i class="${app.icon}"></i>
                        </div>
                        <div class="app-info">
                            <h3 class="app-name">${app.name}</h3>
                            <p class="app-description">${app.description}</p>
                        </div>
                    </div>
                `);
                
                $card.data('app', app);
                $grid.append($card);
            });
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            var self = this;
            
            // Home button click - delegate to handle dynamic elements
            $(document).on('click', '.o_menu_brand, [data-home-trigger], .o_home_menu', function(e) {
                e.preventDefault();
                self.open();
            });
            
            // Back button
            $(document).on('click', '#overlayBackBtn, .overlay-backdrop', function() {
                self.close();
            });
            
            // Search
            $(document).on('input', '#searchApps', function() {
                self.filterApps($(this).val());
            });
            
            // App card click
            $(document).on('click', '.app-card', function() {
                var app = $(this).data('app');
                self.openApp(app);
            });
            
            // ESC key
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && self.isVisible) {
                    self.close();
                }
            });
        },

        /**
         * Open overlay
         */
        open: function() {
            this.isVisible = true;
            $('#homeMenuOverlay').addClass('active');
            $('body').css('overflow', 'hidden');
        },

        /**
         * Close overlay
         */
        close: function() {
            this.isVisible = false;
            $('#homeMenuOverlay').removeClass('active');
            $('body').css('overflow', '');
            $('#searchApps').val('');
            this.filteredApps = this.apps;
            this.renderApps();
        },

        /**
         * Filter apps by search query
         */
        filterApps: function(query) {
            query = query.toLowerCase();
            
            if (query === '') {
                this.filteredApps = this.apps;
            } else {
                this.filteredApps = this.apps.filter(function(app) {
                    return app.name.toLowerCase().includes(query) ||
                           app.description.toLowerCase().includes(query);
                });
            }
            
            this.renderApps();
        },

        /**
         * Open app
         */
        openApp: function(app) {
            this.close();
            
            // If app has an element (from DOM parsing), click it
            if (app.element) {
                app.element.click();
                return;
            }
            
            // Try to trigger action via Odoo's action service
            if (app.actionID && window.odoo && window.odoo.__DEBUG__) {
                try {
                    var actionService = window.odoo.__DEBUG__.services['action'];
                    if (actionService && actionService.doAction) {
                        actionService.doAction(app.actionID);
                        return;
                    }
                } catch(e) {
                    console.warn('Could not trigger action:', e);
                }
            }
            
            // Fallback: navigate to URL if available
            if (app.url) {
                window.location.href = app.url;
            }
        }
    };

    // Auto-initialize on document ready
    $(document).ready(function() {
        // Small delay to ensure Odoo is fully loaded
        setTimeout(function() {
            HomeMenuOverlay.init();
        }, 500);
    });

    // Expose globally
    window.HomeMenuOverlay = HomeMenuOverlay;

})(jQuery);
