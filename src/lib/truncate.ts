export function truncate(string_: string, maxLength: number): string {
	if (string_.length <= maxLength) {
		return string_;
	}

	return maxLength <= 3 ? string_.slice(0, maxLength) : string_.slice(0, maxLength - 3) + '...';
}
