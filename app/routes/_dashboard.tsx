import { Outlet } from '@remix-run/react';
import Logo from '~/components/Logo';
import LogoIcon from '~/components/LogoIcon';

export default function DashboardLayout() {
	return (
		<>
			<header>
				<div className="flex">
					<Logo className="hidden md:inline" />
					<LogoIcon className="inline md:hidden" />
				</div>
			</header>
			<Outlet />
		</>
	);
}
