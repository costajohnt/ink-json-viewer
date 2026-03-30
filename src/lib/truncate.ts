export function truncate(string_: string, maxLength: number): string {
	if (string_.length <= maxLength) {
		return string_;
	}

	if (maxLength <= 3) {
		return string_.slice(0, maxLength);
	}

	return string_.slice(0, maxLength - 3) + '...';
}
