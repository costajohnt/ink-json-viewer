import {Text} from 'ink';
import type {JsonViewerTheme} from '../../types.js';

type JsonBracketProps = {
	bracket: string;
	theme: JsonViewerTheme;
};

export function JsonBracket({bracket, theme}: JsonBracketProps) {
	return <Text color={theme.colors.bracket}>{bracket}</Text>;
}
