import {Component, ElementRef, HostListener, inject, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from '../../../features/auth/auth.service';

export interface NavItem {
    label: string;
    icon: string;
    route: string;
    active: boolean;
}

@Component({
    selector: 'app-header',
    imports: [CommonModule],
    templateUrl: './header.html',
    styleUrl: './header.scss'
})
export class HeaderComponent {
    private router = inject(Router);
    private authService = inject(AuthService);

    @ViewChild('profileSection') profileSection!: ElementRef;

    username = signal('trader_yash');
    userInitial = signal('Y');
    menuVisible = signal(false);

    navItems = signal<NavItem[]>([
        {label: 'Journal', icon: 'pi pi-book', route: '/journal', active: true},
        {label: 'Analytics', icon: 'pi pi-chart-bar', route: '/analytics', active: false},
        {label: 'Data Importer', icon: 'pi pi-cloud-upload', route: '/trade/file-upload', active: false}
    ]);

    constructor() {
    }

    navigateTo(item: NavItem) {
        // Update active state
        this.navItems.update(items =>
            items.map(nav => ({...nav, active: nav.label === item.label}))
        );

        // Navigate to route
        this.router.navigate([item.route]);
    }

    toggleMenu(event: Event) {
        event.stopPropagation();
        this.menuVisible.set(!this.menuVisible());
    }

    showMenu() {
        this.menuVisible.set(true);
    }

    hideMenu() {
        this.menuVisible.set(false);
    }

    isMenuVisible() {
        return this.menuVisible();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        // Close menu if clicking outside the profile section
        if (this.profileSection && !this.profileSection.nativeElement.contains(event.target)) {
            this.hideMenu();
        }
    }

    @HostListener('document:keydown.escape')
    onEscapeKey() {
        this.hideMenu();
    }

    viewProfile() {
        this.hideMenu();
        // Navigate to profile page
        this.router.navigate(['/profile']);
    }

    viewSettings() {
        this.hideMenu();
        // Navigate to settings page
        this.router.navigate(['/settings']);
    }

    logout() {
        this.hideMenu();

        // Call logout API to expire token on server
        this.authService.logout().subscribe({
            error: (err) => {
                // Even if API call fails, still clear local data and navigate
                console.error('Logout API call failed:', err);
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
