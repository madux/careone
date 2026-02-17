/**
 * Home Menu Overlay - Pure jQuery Implementation for Odoo 17
 * Version 3.0 - Fixed for Odoo's o-dropdown component
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
            
            console.log('Initializing Home Menu Overlay...');
            
            this.loadApps();
            this.createOverlay();
            this.bindEvents();
            this.hijackHomeMenu();
            this.isInitialized = true;
            
            console.log('Home Menu Overlay initialized successfully');
        },

        /**
         * Hijack the home menu dropdown
         */
        hijackHomeMenu: function() {
            var self = this;
            
            // Wait for DOM to be fully ready
            setTimeout(function() {
                // Find the home menu button and its parent dropdown
                var $homeButton = $('button.dropdown-toggle[title="Home Menu"]');
                var $dropdown = $homeButton.closest('.o-dropdown, .dropdown');
                
                if ($homeButton.length > 0) {
                    console.log('Found Home Menu button, hijacking...');
                    
                    // Method 1: Replace the button's click handler completely
                    $homeButton.replaceWith(function() {
                        var $newBtn = $(this).clone(false); // Clone without events
                        $newBtn.removeAttr('data-hotkey aria-expanded');
                        $newBtn.removeClass('dropdown-toggle');
                        $newBtn.attr('data-home-trigger', 'true');
                        return $newBtn;
                    });
                    
                    // Get the new button
                    var $newButton = $dropdown.find('button[title="Home Menu"]');
                    
                    // Add our click handler
                    $newButton.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        console.log('Home Menu clicked - opening overlay');
                        self.open();
                        return false;
                    });
                    
                    // Method 2: Hide the dropdown menu permanently
                    if ($dropdown.length > 0) {
                        // Remove show class if present
                        $dropdown.removeClass('show');
                        $dropdown.find('.dropdown-menu, .o-dropdown--menu').remove();
                        
                        // Prevent dropdown from showing
                        $dropdown.on('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    }
                    
                    console.log('Home Menu successfully hijacked!');
                } else {
                    console.warn('Home Menu button not found');
                }
            }, 1000);
        },

        /**
         * Load apps from Odoo menu
         */
        loadApps: function() {
            var self = this;
            
            console.log('Loading apps from backend...');
            
            // First, try to load from our custom endpoint
            $.ajax({
                url: '/home_menu/get_apps',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {}
                }),
                success: function(response) {
                    if (response.result && response.result.length > 0) {
                        console.log('Loaded ' + response.result.length + ' apps from backend');
                        self.apps = response.result.map(function(app, index) {
                            return {
                                id: app.id,
                                name: app.name,
                                description: app.summary || app.name,
                                category: app.category || 'Apps',
                                icon: self.getAppIconFromData(app),
                                color: self.getAppColor(index),
                                actionID: app.action_id,
                                actionModel: app.action_model,
                                xmlid: app.xmlid,
                                module: app.module,
                                webIcon: app.web_icon,
                                menuId: app.id
                            };
                        });
                        self.filteredApps = self.apps;
                        self.renderApps();
                    } else {
                        console.warn('No apps returned from backend, using fallback');
                        self.loadAppsFallback();
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error loading apps from backend:', error);
                    console.log('Falling back to client-side loading');
                    self.loadAppsFallback();
                }
            });
        },
        
        /**
         * Fallback: Load apps from Odoo menu service or DOM
         */
        loadAppsFallback: function() {
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
                        this.filteredApps = this.apps;
                        this.renderApps();
                        console.log('Loaded ' + this.apps.length + ' apps from menu service');
                        return;
                    }
                } catch(e) {
                    console.warn('Could not load apps from menu service:', e);
                }
            }
            
            // Parse from existing menu
            this.apps = this.parseAppsFromDOM();
            this.filteredApps = this.apps;
            this.renderApps();
            console.log('Loaded ' + this.apps.length + ' apps from DOM');
        },
        
        /**
         * Get icon from app data (with web_icon support)
         */
        getAppIconFromData: function(app) {
            // If has web_icon, try to use it
            if (app.web_icon) {
                // Check if it contains common icon class patterns
                if (app.web_icon.includes('fa-') || app.web_icon.includes('oi-')) {
                    var iconMatch = app.web_icon.match(/(fa|oi)[\s-][\w-]+/g);
                    if (iconMatch && iconMatch.length > 0) {
                        return iconMatch.join(' ');
                    }
                }
            }
            
            // Fall back to name-based icon mapping
            return this.getAppIcon(app);
        },

        /**
         * Parse apps from existing DOM menu
         */
        parseAppsFromDOM: function() {
            var self = this;
            var apps = [];
            var index = 0;
            
            // Look for menu items in the dropdown that was shown
            $('.o-dropdown--menu .dropdown-item, .dropdown-menu .dropdown-item').each(function() {
                var $item = $(this);
                var name = $item.text().trim();
                var actionId = $item.data('menu-xmlid') || $item.data('menu') || $item.attr('href');
                
                if (name && name !== '') {
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
            
            // If still no apps, look in navbar
            if (apps.length === 0) {
                $('.o_menu_sections .dropdown-item, .o_navbar_apps_menu .dropdown-item').each(function() {
                    var $item = $(this);
                    var name = $item.text().trim();
                    
                    if (name) {
                        apps.push({
                            id: 'app_' + index,
                            name: name,
                            description: name,
                            icon: self.extractIconClass($item),
                            color: self.getAppColor(index),
                            element: $item
                        });
                        index++;
                    }
                });
            }
            
            // If still no apps, create sample data
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
                { name: 'Discuss', icon: 'oi oi-comments', description: 'Team Communication' },
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
                'Discuss': 'oi oi-comments',
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
            
            // Back button and backdrop
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
            
            // Also bind to any element with data-home-trigger
            $(document).on('click', '[data-home-trigger]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.open();
            });
        },

        /**
         * Open overlay
         */
        open: function() {
            console.log('Opening overlay...');
            this.isVisible = true;
            $('#homeMenuOverlay').addClass('active');
            $('body').css('overflow', 'hidden');
            
            // Make sure dropdown is closed
            $('.o-dropdown.show, .dropdown.show').removeClass('show');
            $('.o-dropdown--menu, .dropdown-menu').removeClass('show').hide();
        },

        /**
         * Close overlay
         */
        close: function() {
            console.log('Closing overlay...');
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
            console.log('Opening app:', app.name);
            this.close();
            
            var self = this;
            
            // Method 1: Use menu_id to trigger Odoo menu
            if (app.menuId) {
                setTimeout(function() {
                    // Try to find and click the menu item
                    var $menuItem = $('[data-menu="' + app.menuId + '"]');
                    if ($menuItem.length > 0) {
                        console.log('Clicking menu item');
                        $menuItem[0].click();
                        return;
                    }
                    
                    // Fallback: use web client's menu service
                    if (window.odoo && window.odoo.__DEBUG__) {
                        try {
                            var menuService = window.odoo.__DEBUG__.services['menu'];
                            if (menuService && menuService.selectMenu) {
                                console.log('Using menu service');
                                menuService.selectMenu(app.menuId);
                                return;
                            }
                        } catch(e) {
                            console.warn('Menu service failed:', e);
                        }
                    }
                    
                    // Last resort: navigate via URL
                    self.openAppByAction(app);
                }, 300);
                return;
            }
            
            // Method 2: If app has an element (from DOM parsing), click it
            if (app.element) {
                setTimeout(function() {
                    app.element[0].click();
                }, 300);
                return;
            }
            
            // Method 3: Try action
            this.openAppByAction(app);
        },
        
        /**
         * Open app by action ID
         */
        openAppByAction: function(app) {
            // Try to trigger action via Odoo's action service
            if (app.actionID && window.odoo && window.odoo.__DEBUG__) {
                try {
                    var actionService = window.odoo.__DEBUG__.services['action'];
                    if (actionService && actionService.doAction) {
                        console.log('Using action service');
                        actionService.doAction(app.actionID);
                        return;
                    }
                } catch(e) {
                    console.warn('Could not trigger action:', e);
                }
            }
            
            // Fallback: try to navigate by URL if we have xmlid
            if (app.xmlid) {
                var url = '/web#menu_id=' + app.menuId;
                console.log('Navigating to:', url);
                window.location.hash = '#menu_id=' + app.menuId;
            } else {
                console.warn('Could not open app - no handler found');
            }
        }
    };

    // Auto-initialize with multiple attempts
    $(document).ready(function() {
        console.log('Document ready, scheduling initialization...');
        
        // First attempt - early
        setTimeout(function() {
            HomeMenuOverlay.init();
        }, 500);
        
        // Second attempt - after Odoo loads
        setTimeout(function() {
            if (!HomeMenuOverlay.isInitialized) {
                HomeMenuOverlay.init();
            } else {
                // Re-hijack in case DOM changed
                HomeMenuOverlay.hijackHomeMenu();
            }
        }, 2000);
        
        // Third attempt - late fallback
        setTimeout(function() {
            if (!HomeMenuOverlay.isInitialized) {
                console.warn('Late initialization attempt...');
                HomeMenuOverlay.init();
            }
        }, 5000);
    });

    // Expose globally
    window.HomeMenuOverlay = HomeMenuOverlay;

})(jQuery);
