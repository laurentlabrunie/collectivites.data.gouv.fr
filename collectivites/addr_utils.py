# -*- coding: utf-8 -*-

import re

# typeof street as list of key words, sorted by descendant number of occurences
TYPEOF_STREET_VALUES = [
	'RUE'
	,'LIEU DIT'
	,'CHEMIN'
	,'IMPASSE'
	,'ROUTE'
	,'ALLEE'
	,'PLACE'
	,'AVENUE'
	,'LOTISSEMENT'
	,'QUARTIER'
	,'RESIDENCE'
	,'BOULEVARD'
	,'RUELLE'
	,'SQUARE'
	,'PASSAGE'
	,'HAMEAU'
	,'MOULIN'
	,'FERME'
	,'SENTE'
	,'CITE'
	,'CHEZ'
	,'CLOS'
	,'DOMAINE'
	,'MONTEE'
	,'MAS'
	,'CHATEAU'
	,'COUR'
	,'QUAI'
	,'TRAVERSE'
	,'ZONE ARTISANALE'
	,'PONT'
	,'BOIS'
	,'ROND POINT'
	,'VOIE'
	,'VILLA'
	,'COTE'
	,'VENELLE'
	,'VILLAGE'
	,'PARC'
	,'COURS'
	,'PROMENADE'
	,'ZONE INDUSTRIELLE'
	,'IMMEUBLE'
	,'PETITE RUE'
	,'HLM'
	,'PRE'
	,'CARREFOUR'
	,'ESPLANADE'
	,'CENTRE COMMERCIAL'
	,'PLAN'
	,'MAIL'
	,'ECLUSE'
	,'FAUBOURG'
	,'ANCIEN CHEMIN'
	,'VAL'
	,'ESPACE'
	,'MAISON FORESTIERE'
	,'ZONE D AMENAGEMENT CONCERTE'
	,'CAMP'
	,'PORT'
	,'ZONE'
	,'CAMPAGNE'
	,'GRAND RUE'
	,'CHAUSSEE'
	,'PLAINE'
	,'ESCALIER'
	,'ANCIENNE ROUTE'
	,'JARDIN'
	,'BOURG'
	,'ETANG'
	,'MANOIR'
	,'COL'
	,'PORTE'
	,'FONTAINE'
	,'ROC'
	,'CAMPING'
	,'RAMPE'
	,'BOUCLE'
	,'CORNICHE'
	,'AIRE'
	,'CARRIERE'
	,'CENTRAL'
	,'ILE'
	,'PAVILLON'
	,'PETIT CHEMIN'
	,'VIEUX CHEMIN'
	,'GARE'
	,'DESCENTE'
	,'ENCLOS'
	,'TOUR'
	,'PARVIS'
	,'PARKING'
	,'GALERIE'
	,'PLATEAU'
	,'TERRASSE'
	,'CAVEE'
	,'CHALET'
	,'CASTEL'
	,'POINTE'
	,'ENCEINTE'
	,'VIEILLE ROUTE'
	,'CONTOUR'
	,'FORT'
	,'PASSERELLE'
	,'ABBAYE'
	,'PASSE'
	,'PLAGE'
	,'TERRAIN'
	,'STATION'
	,'DIGUE'
	,'CHAPELLE'
	,'FOSSE'
	,'CHEMINEMENT'
	,'BARRIERE'
	,'LEVEE'
	,'GROUPE'
	,'REMPART'
	,'TERTRE'
	,'VIA'
	,'PASSAGE A NIVEAU'
	,'CARRE'
	,'PETITE ROUTE'
	,'ANSE'
	,'BUTTE'
	,'FOYER'
	,'MARCHE'
	,'PLACIS'
	,'COLLINE'
	,'COTTAGE'
	,'STADE'
	,'AUTOROUTE'
	,'EGLISE'
	,'CALE'
	,'RACCOURCI'
	,'PRESQU ILE'
	,'TERRE PLEIN'
	,'AGGLOMERATION'
	,'CARREAU'
	,'GARENNE'
	,'ARCADE'
	,'CHEMIN VICINAL'
	,'HALLE'
	,'BERGE'
	,'GRILLE'
	,'PETITE AVENUE'
	,'PALAIS'
	,'FORUM'
	,'PETITE ALLEE'
	,'BASTIDE'
	,'PETITE IMPASSE'
	,'POURTOUR'
	,'DEGRE'
	,'BEGUINAGE'
	,'CLOITRE'
	,'MUSEE'
	,'PATIO'
	,'RAIDILLON'
	,'ROTONDE'
	,'JETEE'
	,'POTERNE'
	,'NOUVELLE ROUTE'
	,'ROQUET'
	,'PORTIQUE'
	,'PERISTYLE'
	,'BAS CHEMIN'
	,'PERIPHERIQUE'
	,'METRO'
	,'HIPPODROME'
	,'DARSE'
	,'GRIMPETTE'
	,'HAUT CHEMIN'
	,'CHARMILLE'
	,'GRAND BOULEVARD'
	,'GROUPEMENT'
	,'ZONE D AMENAGEMENT DIFFERE'
	,'ZONE A URBANISER EN PRIORITE'
	,'BASTION'
	,'ENCLAVE'
]

STRONG_WORD_EXCLUDE_LAPOSTE = [
	'INFERIEUR'
	,'INFERIEURE'
	,'INFERIEURS'
	,'INFERIEURES'
	,'SUPERIEUR'
	,'SUPERIEURE'
	,'SUPERIEURS'
	,'SUPERIEURES'
	,'PROLONGE'
	,'PROLONGEE'
	,'PROLONGEES'
]

STRONG_WORD_EXCLUDE_IGN = [
	'PAIR'
	,'PAIRE'
	,'IMPAIR'
	,'IMPAIRE'
	,'BIS'
	,'TER'
	,'QUATER'
	,'NO'
	,'NR'
	,'NORD'
	,'EST'
	,'SUD'
	,'OUEST'
	,'HAMEAU'
	,'SUR'
	,'SOUS'
	,'HAUT'
	,'HAUTS'
	,'HAUTE'
	,'HAUTES'
	,'BAS'
	,'BASSE'
	,'BASSES'
	,'BRAZ'
	,'VRAZ'
	,'BRAS'
	,'VRAS'
	,'BIHAN'
	,'VIHAN'
	,'BIAN'
	,'VIAN'
	,'HUEL'
	,'IZEL'
	,'HUELLA'
	,'UHELLA'
	,'IZELLA'
	,'H'
	,'PELLA'
	,'TOSTA'
	,'NEVEZ'
	,'NEVE'
	,'NEHUE'
	,'NEUE'
	,'AL'
	,'AR'
	,'AN'
	,'ER'
	,'UR'
	,'UN'
	,'COZ'
	,'CREIS'
	,'KREIS'
	,'CREIZ'
	,'KREIZ'
	,'DU'
	,'IHUEL'
	,'UHEL'
	,'GUEN'
	,'GWEN'
]

ARTICLES_VALUES = [
	'LE'
	,'LA'
	,'LES'
	,'L'
	,'DE'
	,'DU'
	,'DES'
	,'D'
	,'A'
	,'AU'
	,'AUX'
	,'UN'
	,'UNE'
]

SIZE_TYPEOF_STREET_VALUES = len(TYPEOF_STREET_VALUES)
TYPEOF_STREET_WORDS_COUNT = [ x.count(" ") +1 for x in TYPEOF_STREET_VALUES ]

# I to XXIII : ^[X]*(I{1,3}|[I]?V|V[I]{0,3}|[I]?X)$
# all : '^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$'
IS_ROMAN_NUMBER_RE = re.compile('^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$')

def guess_typeof_street(street, list):
	"""
	identify type of street from complete label
	:param street: complete label
	:param list: list of words
	:return: type of street
	"""
	i = 0
	while i < SIZE_TYPEOF_STREET_VALUES :
		if TYPEOF_STREET_WORDS_COUNT[i] < len(list) and \
			" ".join(list[:TYPEOF_STREET_WORDS_COUNT[i]]) == TYPEOF_STREET_VALUES[i]:
			return TYPEOF_STREET_VALUES[i]
		i += 1

	# w/o type of street
	return ''

def is_roman_number(last_word):
	"""
	determine if given word is a roman number
	:param word:
	:return: boolean result
	"""
	roman = IS_ROMAN_NUMBER_RE.match(last_word)
	return (roman == None)

def is_numeric(word):
	"""
	determine if given word is a number
	:param word:
	:return: boolean result
	"""
	try:
		integer = int(word)
	except ValueError as e:
		return False
	return True

def guess_strong_word(street, list):
	"""
	evaluate strong word from complete label (of street)
	:param street: complete label
	:param list: list of words
	:return: strong word
	"""
	i = len(list) -1
	while i >= 0 :
		if not is_roman_number(list[i]) and not is_numeric(list[i]) :
			if list[i] not in STRONG_WORD_EXCLUDE_LAPOSTE and \
				list[i] not in STRONG_WORD_EXCLUDE_IGN and \
				list[i] not in ARTICLES_VALUES :
				return list[i]
		i -= 1

	return list[-1]


# for tests
if __name__ == '__main__' :
	while True :
		street = input('Entrer libellé Voie: ')
		list_words = re.split('\s*', street.upper())

		tos = guess_typeof_street(street, list_words)
		print(' type de Voie : ' + tos)

		# is_roman = is_roman_number(list_words[-1])
		# result = "oui" if is_roman else "non"
		# print(' dernier mot est un nombre romain : ' + result)
        #
		# is_numeric = is_numeric(list_words[-1])
		# result = "oui" if is_numeric else "non"
		# print(' dernier mot est un nombre : ' + result)

		sw = guess_strong_word(street, list_words)
		print(' mot important de la Voie : ' + sw)