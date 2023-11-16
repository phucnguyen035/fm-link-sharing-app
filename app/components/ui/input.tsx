import * as React from 'react';

import { cn } from '~/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: React.ReactNode;
	error?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, icon, error, type, ...props }, ref) => {
		return (
			<div className="relative">
				{icon && (
					<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
						{icon}
					</div>
				)}
				<input
					type={type}
					className={cn(
						'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:border-destructive',
						icon && 'pl-10',
						className,
					)}
					ref={ref}
					aria-invalid={error ? true : undefined}
					{...props}
				/>
			</div>
		);
	},
);
Input.displayName = 'Input';

export { Input };
